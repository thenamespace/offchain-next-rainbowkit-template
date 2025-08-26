import { createOffchainClient } from "@thenamespace/offchain-manager";
const client = createOffchainClient({
    defaultApiKey : process.env.NAMESPACE_API_KEY!
});

export default client;