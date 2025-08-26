import { NextRequest, NextResponse } from 'next/server';
import { ChainName } from "@thenamespace/offchain-manager";
import client from "@/lib/namespace";
import { normalize } from 'viem/ens'

// Define the request body type
interface CreateSubnameRequest {
    label: string;
    address: string;
    displayName: string;
    pfpUrl: string;
}
const ENS_NAME = process.env.ENS_NAME!;

export async function POST(request: NextRequest) {
    try {
        const body: CreateSubnameRequest = await request.json();

        // Validate required fields
        if (!body.label || !body.address) {
            return NextResponse.json({
                error: 'Missing required fields: label and address are required'
            }, { status: 400 });
        }
        const normalizedAddress = body.address.toLowerCase().trim();
        const finalLabel = normalize(body.label);
        const fullSubname = `${finalLabel}.${ENS_NAME}`;

        // Prevent creating subnames for the zero address
        if (normalizedAddress === "0x0000000000000000000000000000000000000000") {
            return NextResponse.json({
                error: 'Cannot create subname for zero address'
            }, { status: 400 });
        }

        // Check if the exact subname already exists using direct availability check
        try {
            const isAvailable = await client.isSubnameAvailable(fullSubname);
            if (!isAvailable) {
                return NextResponse.json({
                    error: 'Subname with this label already exists',
                    existing: fullSubname
                }, { status: 409 });
            }
        } catch (availabilityError) {
            console.error('Error checking subname availability:', availabilityError);
            return NextResponse.json({
                error: 'Failed to check subname availability',
                details: availabilityError instanceof Error ? availabilityError.message : 'Unknown error'
            }, { status: 500 });
        }

        // Check if this address already has a subname using metadata search
        const existingAddressCheck = await client.getFilteredSubnames({
            parentName: ENS_NAME,
            owner: normalizedAddress
        });

        if (existingAddressCheck?.items && existingAddressCheck.items.length > 0) {
            const existingSubname = existingAddressCheck.items[0];
            if (existingSubname?.fullName) {
                return NextResponse.json({
                    error: 'Address already has a subname',
                    existing: existingSubname.fullName
                }, { status: 409 });
            }
        }

        // Prepare text records and metadata from Farcaster data
        const texts: { key: string; value: string }[] = [
            { key: "avatar", value: body.pfpUrl },
            { key: "name", value: body.displayName },
        ];

        const metadata: { key: string; value: string }[] = [
            { key: "sender", value: normalizedAddress }, 
        ];
        


        // Create the subname using normalized values with comprehensive data
        const result = await client.createSubname({
            label: finalLabel,
            parentName: ENS_NAME,
            addresses: [{ chain: ChainName.Base, value: normalizedAddress } , { chain: ChainName.Ethereum, value: normalizedAddress }],
            texts: texts,
            metadata: metadata,
            owner: normalizedAddress
        });
        return NextResponse.json({
            success: true,
            data: result,
            message: 'Subname created successfully',
        });

    } catch (error) {
        console.error('Error creating subname:', error);
        return NextResponse.json({
            error: 'Failed to create subname',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}