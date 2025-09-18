declare module 'react-avatar-editor' {
  import { Component } from 'react';

  interface AvatarEditorProps {
    image?: string | File;
    width?: number;
    height?: number;
    border?: number | number[];
    borderRadius?: number;
    color?: number[];
    borderColor?: number[];
    backgroundColor?: string;
    style?: React.CSSProperties;
    scale?: number;
    position?: { x: number; y: number };
    rotate?: number;
    crossOrigin?: string;
    className?: string | string[];
    onLoadFailure?: (event: Event) => void;
    onLoadSuccess?: (imgInfo: { resource: HTMLImageElement }) => void;
    onImageReady?: (event: Event) => void;
    onMouseUp?: () => void;
    onMouseMove?: (event: MouseEvent) => void;
    onImageChange?: () => void;
    onPositionChange?: (position: { x: number; y: number }) => void;
    disableBoundaryChecks?: boolean;
    disableHiDPIScaling?: boolean;
  }

  interface AvatarEditorMethods {
    getImage(): HTMLCanvasElement;
    getImageScaledToCanvas(): HTMLCanvasElement;
    getCroppingRect(): { x: number; y: number; width: number; height: number };
  }

  declare class AvatarEditor extends Component<AvatarEditorProps> implements AvatarEditorMethods {
    getImage(): HTMLCanvasElement;
    getImageScaledToCanvas(): HTMLCanvasElement;
    getCroppingRect(): { x: number; y: number; width: number; height: number };
  }

  export = AvatarEditor;
}
