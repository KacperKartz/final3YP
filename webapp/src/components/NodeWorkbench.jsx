import React, { useCallback, useRef } from 'react';
import nodeTypes from './nodes/Nodes';

import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  reconnectEdge,
  addEdge,
  Panel,
  useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';





const initialNodes = [
  {
    id: 'device-1',
    type: 'device',
    position: { x: 0, y: 0 },
    data: { label: 'Device', value: '9454C562BD9C' },
  },
  {
    id: 'type-1',
    type: 'type',
    position: { x: 250, y: 0 },
    data: { label: 'Rule Type', value: 'control' },
  },
  {
    id: 'topic-1',
    type: 'topic',
    position: { x: 500, y: 0 },
    data: { label: 'Topic', value: '/tempSensor' },
  },
  {
    id: 'condition-1',
    type: 'condition',
    position: { x: 750, y: 0 },
    data: { label: 'Condition', value: 'value > 25' },
  },
  {
    id: 'pin-1',
    type: 'pin',
    position: { x: 1000, y: 0 },
    data: { label: 'Pin', value: '2' },
  },
  {
    id: 'action-1',
    type: 'action',
    position: { x: 1250, y: 0 },
    data: { label: 'Action', value: 'on' },
  },
];

const initialEdges = [];

const NodeWorkbench = () => {
  const { setViewport, zoomIn, zoomOut } = useReactFlow();
  const edgeReconnectSuccessful = useRef(true);
  const isDragging = useRef(false);
    const nodeIdRef = useRef(100);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const customNodeTypes = nodeTypes(setNodes); 

/// This feature hasn't been fully developed
const buildRulesFromGraph = () => {
  const rules = [];
  const visited = new Set();

  nodes.forEach((node) => {
    if (node.type === 'device') {
      const rule = { device_id: node.data.value };
      let currentId = edges.find(e => e.source === node.id)?.target;

      while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const current = nodes.find(n => n.id === currentId);
        if (!current) break;

        const { type, data } = current;

        if (type === 'type') rule.type = data.value;
        if (type === 'topic') rule.topic = data.value;
        if (type === 'condition') rule.condition = data.value;
        if (type === 'value') rule.value = data.value;
        if (type === 'pin') rule.pin = parseInt(data.value);
        if (type === 'action') rule.action = data.value;
        if (type === 'interval') rule.interval = parseInt(data.value);
        if (type === 'sensor') rule.sensor = data.value;

        currentId = edges.find(e => e.source === currentId)?.target;
      }

      rules.push(rule);
    }
  });

  return rules;
};



const submitRulesToBackend = async () => {
  const rules = buildRulesFromGraph();

  if (!rules.length) return alert('No rules to submit');

  const deviceId = rules[0].device_id; // assuming one device per flow
  const payload = { device_id: deviceId, rules };

  try {
    const response = await fetch('http://localhost:5000/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert('Rules submitted successfully');
    } else {
      alert('Failed to submit rules');
    }
  } catch (err) {
    console.error('Error submitting rules:', err);
    alert('Error submitting rules');
  }
};








  const history = useRef({
    past: [],
    future: [],
  });


    const addNode = (type) => {
    const id = `${type}-${nodeIdRef.current++}`;
    const newNode = {
      id,
      type,
      position: { x: Math.random() * 600, y: Math.random() * 400 },
      data: { label: type.charAt(0).toUpperCase() + type.slice(1), value: '' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  
  const handleTransform = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 });
  }, [setViewport]);
  
  
  const saveHistory = useCallback(() => {
    history.current.past.push({ nodes, edges });
    if (history.current.past.length > 20) {
      history.current.past.shift(); // keep only last 20
    }
    history.current.future = [];
  }, [nodes, edges]);
  
  const undo = () => {
    const past = history.current.past;
    if (past.length === 0) return;
    
    const previous = past.pop();
    history.current.future.unshift({ nodes, edges });
    
    setNodes(previous.nodes);
    setEdges(previous.edges);
  };
  
  const redo = () => {
    const future = history.current.future;
    if (future.length === 0) return;
    
    const next = future.shift();
    history.current.past.push({ nodes, edges });
    
    setNodes(next.nodes);
    setEdges(next.edges);
  };
  
  const onConnect = useCallback(
    (params) => {
      saveHistory();
      setEdges((els) => addEdge(params, els));
    },
    [saveHistory, setEdges]
  );
  
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
  
  const onReconnect = useCallback((oldEdge, newConnection) => {
    saveHistory();
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, [saveHistory, setEdges]);
  
  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      saveHistory();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
    edgeReconnectSuccessful.current = true;
  }, [saveHistory, setEdges]);
  
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    
    if (changes.some(change => change.type === 'position')) {
      if (!isDragging.current) {
        isDragging.current = true;
      }
    } else if (changes.some(change => change.type === 'position' && change.dragging === false)) {
      // Dragging ended, save once
      if (isDragging.current) {
        saveHistory();
        isDragging.current = false; 
      }
    } else {
      saveHistory();
    }
  }, [onNodesChange, saveHistory]);
  
  const handleEdgesChange = useCallback((changes) => {
    saveHistory();
    onEdgesChange(changes);
  }, [onEdgesChange, saveHistory]);
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>

      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        snapToGrid
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onConnect={onConnect}
        fitView
        attributionPosition="top-right"
         nodeTypes={customNodeTypes}
        style={{ backgroundColor: "#1c2a3a" }}
      >
        <Controls />
      <div style={{ position: 'absolute', zIndex: 10, top: 10, left: 10 }}>
        <button onClick={undo} style={{ marginRight: 8 }}>Undo</button>
        <button onClick={redo}>Redo</button>
                  {['device', 'type', 'topic', 'condition', 'value', 'pin', 'action', 'interval'].map((type) => (
            <button key={type} onClick={() => addNode(type)} style={{ marginRight: 4 }}>{type}</button>
          ))}
      </div>
      <Panel position="top-right">
        <button className="xy-theme__button" onClick={() => zoomIn({ duration: 800 })}>
          zoom in
        </button>
        <button className="xy-theme__button" onClick={() => zoomOut({ duration: 800 })}>
          zoom out
        </button>
        <button className="xy-theme__button" onClick={handleTransform}>
          pan to center(0,0,1)
        </button>
      </Panel>
      <Panel position='bottom-right'>

      <button onClick={submitRulesToBackend} style={{ marginLeft: 16, background: 'green', color: 'white' }}>
  Submit Rules
</button>
      </Panel>

        <Background />
      </ReactFlow>
    </div>
  );
};

export default NodeWorkbench;
