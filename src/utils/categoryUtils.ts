import { nanoid } from 'nanoid';
import { CategoryNode, CategoryTree, TextLine } from '@/types/category';

// Generate unique ID for nodes
export const generateNodeId = (): string => {
  return nanoid(10); // 10 character ID
};

// Generate unique ID for text lines
export const generateLineId = (): string => {
  return nanoid(8); // 8 character ID for lines
};

// Create a new category node
export const createCategoryNode = (
  name: string,
  parentId: string | null = null,
  level: number = 0,
  metadata?: CategoryNode['metadata']
): CategoryNode => {
  const now = new Date();
  return {
    id: generateNodeId(),
    name,
    parentId,
    children: [],
    level,
    metadata,
    createdAt: now,
    updatedAt: now,
  };
};

// Create a new text line
export const createTextLine = (
  text: string,
  level: number = 0,
  nodeId?: string
): TextLine => {
  return {
    id: generateLineId(),
    text,
    level,
    nodeId,
  };
};

// Initialize empty category tree
export const createEmptyCategoryTree = (): CategoryTree => {
  return {
    nodes: {},
    rootIds: [],
  };
};

// Add node to tree
export const addNodeToTree = (
  tree: CategoryTree,
  node: CategoryNode
): CategoryTree => {
  const newTree = { ...tree };
  newTree.nodes[node.id] = node;

  if (node.parentId === null) {
    // Root node
    newTree.rootIds.push(node.id);
  } else {
    // Child node - add to parent's children array
    const parent = newTree.nodes[node.parentId];
    if (parent) {
      parent.children.push(node.id);
      parent.updatedAt = new Date();
    }
  }

  return newTree;
};

// Remove node from tree
export const removeNodeFromTree = (
  tree: CategoryTree,
  nodeId: string
): CategoryTree => {
  const newTree = { ...tree };
  const node = newTree.nodes[nodeId];

  if (!node) return tree;

  // Remove from parent's children
  if (node.parentId) {
    const parent = newTree.nodes[node.parentId];
    if (parent) {
      parent.children = parent.children.filter(id => id !== nodeId);
      parent.updatedAt = new Date();
    }
  } else {
    // Root node
    newTree.rootIds = newTree.rootIds.filter(id => id !== nodeId);
  }

  // Remove the node itself
  delete newTree.nodes[nodeId];

  return newTree;
};

// Update node in tree
export const updateNodeInTree = (
  tree: CategoryTree,
  nodeId: string,
  updates: Partial<CategoryNode>
): CategoryTree => {
  const newTree = { ...tree };
  const node = newTree.nodes[nodeId];

  if (!node) return tree;

  newTree.nodes[nodeId] = {
    ...node,
    ...updates,
    updatedAt: new Date(),
  };

  return newTree;
};

// Get node path (array of node IDs from root to current node)
export const getNodePath = (
  tree: CategoryTree,
  nodeId: string
): string[] => {
  const path: string[] = [];
  let currentId = nodeId;

  while (currentId) {
    const node = tree.nodes[currentId];
    if (!node) break;

    path.unshift(currentId);
    currentId = node.parentId || '';
  }

  return path;
};

// Get node depth (number of levels from root)
export const getNodeDepth = (
  tree: CategoryTree,
  nodeId: string
): number => {
  return getNodePath(tree, nodeId).length - 1;
};

// Convert text lines to category tree
export const textLinesToTree = (lines: TextLine[]): CategoryTree => {
  const tree = createEmptyCategoryTree();
  const nodeStack: { node: CategoryNode; level: number }[] = [];

  lines.forEach((line) => {
    if (!line.text.trim()) return; // Skip empty lines

    const node = createCategoryNode(line.text.trim(), null, line.level);
    
    // Find parent based on level
    while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].level >= line.level) {
      nodeStack.pop();
    }

    if (nodeStack.length > 0) {
      const parent = nodeStack[nodeStack.length - 1].node;
      node.parentId = parent.id;
      node.level = line.level;
    }

    // Add node to tree
    addNodeToTree(tree, node);
    nodeStack.push({ node, level: line.level });
  });

  return tree;
};

// Convert category tree to text lines
export const treeToTextLines = (tree: CategoryTree): TextLine[] => {
  const lines: TextLine[] = [];
  
  const addNodeToLines = (nodeId: string) => {
    const node = tree.nodes[nodeId];
    if (!node) return;

    lines.push(createTextLine(node.name, node.level, node.id));
    
    // Add children
    node.children.forEach(childId => {
      addNodeToLines(childId);
    });
  };

  // Start with root nodes
  tree.rootIds.forEach(rootId => {
    addNodeToLines(rootId);
  });

  return lines;
}; 