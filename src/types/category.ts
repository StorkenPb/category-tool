// Category node data structure
export interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  children: string[]; // Array of child node IDs
  level: number; // Hierarchy level (0 = root, 1 = first child, etc.)
  metadata?: {
    language?: string;
    description?: string;
    [key: string]: string | number | boolean | undefined; // Allow for additional metadata
  };
  createdAt: Date;
  updatedAt: Date;
}

// Category tree structure
export interface CategoryTree {
  nodes: Record<string, CategoryNode>; // Map of node ID to node
  rootIds: string[]; // Array of root node IDs
}

// Text editor line representation
export interface TextLine {
  id: string;
  text: string;
  level: number;
  nodeId?: string; // Optional: linked to existing node
}

// Editor state
export interface CategoryEditorState {
  lines: TextLine[];
  activeLineIndex: number;
  isEditing: boolean;
}

// Actions for text editor
export type EditorAction = 
  | { type: 'CREATE_NODE'; lineIndex: number; name: string; level: number }
  | { type: 'UPDATE_NODE'; nodeId: string; name: string }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'MOVE_NODE'; nodeId: string; newParentId: string | null; newLevel: number }
  | { type: 'SET_ACTIVE_LINE'; index: number }
  | { type: 'SET_EDITING'; isEditing: boolean }; 