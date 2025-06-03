import React from 'react';
import { Handle, Position } from '@xyflow/react';

const BasicFieldNode = ({ id, data, setNodes }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, value, label: `${data.label}: ${value}` } } : node
      )
    );
  };

  return (
    <div style={{ padding: 10, border: '2px solid #ccc', borderRadius: 6, background: '#282c34', color: 'white', width: 180 }}>
      <strong>{data.label}</strong>
      <input
        style={{ width: '100%', marginTop: 6 }}
        value={data.value || ''}
        onChange={handleChange}
        placeholder={data.label}
      />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};



export default (setNodes) => ({
  device: (props) => <BasicFieldNode {...props} type="device" setNodes={setNodes} />,
  type: (props) => <BasicFieldNode {...props} type="type" setNodes={setNodes} />,
  topic: (props) => <BasicFieldNode {...props} type="topic" setNodes={setNodes} />,
  condition: (props) => <BasicFieldNode {...props} type="condition" setNodes={setNodes} />,
  value: (props) => <BasicFieldNode {...props} type="value" setNodes={setNodes} />,
  pin: (props) => <BasicFieldNode {...props} type="pin" setNodes={setNodes} />,
  action: (props) => <BasicFieldNode {...props} type="action" setNodes={setNodes} />,
  interval: (props) => <BasicFieldNode {...props} type="interval" setNodes={setNodes} />,
});
