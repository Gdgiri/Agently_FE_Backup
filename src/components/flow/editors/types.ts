export type NodeUpdateHandler = (key: string, value: any) => void;

export interface EditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}
