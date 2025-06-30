import { CategoryTree, TextLine, CategoryNode } from '@/types/category';
import { textLinesToTree, treeToTextLines, createEmptyCategoryTree } from './categoryUtils';

// Data integration interface
export interface DataIntegrationState {
  tree: CategoryTree;
  lines: TextLine[];
  lastSyncTimestamp: number;
}

// Initialize data integration state
export const createDataIntegrationState = (): DataIntegrationState => {
  return {
    tree: createEmptyCategoryTree(),
    lines: [],
    lastSyncTimestamp: Date.now(),
  };
};

// Sync text lines to category tree
export const syncLinesToTree = (lines: TextLine[]): CategoryTree => {
  return textLinesToTree(lines);
};

// Sync category tree to text lines
export const syncTreeToLines = (tree: CategoryTree): TextLine[] => {
  return treeToTextLines(tree);
};

// Update data integration state from text lines
export const updateFromLines = (
  currentState: DataIntegrationState,
  lines: TextLine[]
): DataIntegrationState => {
  const tree = syncLinesToTree(lines);
  
  return {
    tree,
    lines: [...lines], // Create a copy
    lastSyncTimestamp: Date.now(),
  };
};

// Update data integration state from category tree
export const updateFromTree = (
  currentState: DataIntegrationState,
  tree: CategoryTree
): DataIntegrationState => {
  const lines = syncTreeToLines(tree);
  
  return {
    tree: { ...tree }, // Create a copy
    lines,
    lastSyncTimestamp: Date.now(),
  };
};

// Export functions for different formats

// Export to JSON
export const exportToJSON = (state: DataIntegrationState): string => {
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    tree: state.tree,
    metadata: {
      totalNodes: Object.keys(state.tree.nodes).length,
      rootNodes: state.tree.rootIds.length,
      maxDepth: Math.max(...Object.values(state.tree.nodes).map(node => node.level), 0),
    },
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Import from JSON
export const importFromJSON = (jsonString: string): DataIntegrationState => {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.tree || !data.tree.nodes || !data.tree.rootIds) {
      throw new Error('Invalid JSON format: missing tree structure');
    }
    
    const tree: CategoryTree = data.tree;
    const lines = syncTreeToLines(tree);
    
    return {
      tree,
      lines,
      lastSyncTimestamp: Date.now(),
    };
  } catch (error) {
    throw new Error(`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export to CSV (for spreadsheet compatibility)
export const exportToCSV = (state: DataIntegrationState): string => {
  const nodes = Object.values(state.tree.nodes);
  
  if (nodes.length === 0) {
    return 'id,name,parentId,level,createdAt,updatedAt\n';
  }
  
  const headers = ['id', 'name', 'parentId', 'level', 'createdAt', 'updatedAt'];
  const csvRows = [headers.join(',')];
  
  nodes.forEach(node => {
    const row = [
      node.id,
      `"${node.name.replace(/"/g, '""')}"`, // Escape quotes in name
      node.parentId || '',
      node.level.toString(),
      node.createdAt.toISOString(),
      node.updatedAt.toISOString(),
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

// Import from CSV
export const importFromCSV = (csvString: string): DataIntegrationState => {
  try {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }
    
    const headers = lines[0].split(',');
    const requiredHeaders = ['id', 'name', 'parentId', 'level'];
    
    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        throw new Error(`Missing required header: ${header}`);
      }
    }
    
    const tree = createEmptyCategoryTree();
    const nodeMap = new Map<string, CategoryNode>();
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < headers.length) continue;
      
      const node: CategoryNode = {
        id: values[headers.indexOf('id')],
        name: values[headers.indexOf('name')].replace(/^"|"$/g, '').replace(/""/g, '"'), // Unescape quotes
        parentId: values[headers.indexOf('parentId')] || null,
        children: [],
        level: parseInt(values[headers.indexOf('level')]) || 0,
        createdAt: new Date(values[headers.indexOf('createdAt')] || Date.now()),
        updatedAt: new Date(values[headers.indexOf('updatedAt')] || Date.now()),
      };
      
      nodeMap.set(node.id, node);
    }
    
    // Build tree structure
    nodeMap.forEach(node => {
      tree.nodes[node.id] = node;
      
      if (node.parentId === null || node.parentId === '') {
        tree.rootIds.push(node.id);
      } else {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(node.id);
        }
      }
    });
    
    const textLines = syncTreeToLines(tree);
    
    return {
      tree,
      lines: textLines,
      lastSyncTimestamp: Date.now(),
    };
  } catch (error) {
    throw new Error(`Failed to import CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Validation functions
export const validateTree = (tree: CategoryTree): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for orphaned nodes
  const allNodeIds = new Set(Object.keys(tree.nodes));
  const referencedNodeIds = new Set<string>();
  
  Object.values(tree.nodes).forEach(node => {
    if (node.parentId && node.parentId !== null) {
      referencedNodeIds.add(node.parentId);
    }
    node.children.forEach(childId => {
      referencedNodeIds.add(childId);
    });
  });
  
  // Check if all referenced nodes exist
  referencedNodeIds.forEach(nodeId => {
    if (!allNodeIds.has(nodeId)) {
      errors.push(`Referenced node ${nodeId} does not exist`);
    }
  });
  
  // Check for circular references
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const hasCycle = (nodeId: string): boolean => {
    if (recursionStack.has(nodeId)) {
      return true;
    }
    
    if (visited.has(nodeId)) {
      return false;
    }
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const node = tree.nodes[nodeId];
    if (node) {
      for (const childId of node.children) {
        if (hasCycle(childId)) {
          return true;
        }
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  };
  
  tree.rootIds.forEach(rootId => {
    if (hasCycle(rootId)) {
      errors.push(`Circular reference detected starting from root node ${rootId}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get tree statistics
export const getTreeStats = (tree: CategoryTree) => {
  const nodes = Object.values(tree.nodes);
  
  return {
    totalNodes: nodes.length,
    rootNodes: tree.rootIds.length,
    maxDepth: Math.max(...nodes.map(node => node.level), 0),
    averageDepth: nodes.length > 0 ? nodes.reduce((sum, node) => sum + node.level, 0) / nodes.length : 0,
    leafNodes: nodes.filter(node => node.children.length === 0).length,
    internalNodes: nodes.filter(node => node.children.length > 0).length,
  };
}; 