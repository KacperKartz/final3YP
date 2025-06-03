import React from 'react'
import  NodeWorkbench from '../components/NodeWorkbench'
import RuleForm from '../components/RuleForm'
import { ReactFlowProvider } from '@xyflow/react';

const NodesPage = () => {
  return (
    <div className='node-workbench-container'>
      <button onClick={() => window.location.href = "/"}>Return home</button>
      <h1>Nodes</h1>
      <ReactFlowProvider>
      <NodeWorkbench />
    </ReactFlowProvider>
    </div>
  )
}

export default NodesPage