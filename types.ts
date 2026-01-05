
export type InputContent = {
    type: 'text';
    content: string;
} | {
    type: 'image';
    content: {
        mimeType: string;
        data: string;
    };
};

export enum InputMode {
    Upload = 'upload',
    Text = 'text',
}
