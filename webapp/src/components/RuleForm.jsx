import React , { useState } from 'react';
import {handleAddForm, handleFormChange, handleAddRule, handleChange ,handleSubmit, removeForm} from '../Utils/ruleFormHandlers'


const RuleForm = ({deviceId}) => {

    

      const [forms, setForms] = useState([
        {
          type: 'control', // or 'reading'
          topic: '',
          condition: '',
          sensor: '',
          value: '',
          pin: '',
          action: '',
          interval: '' 
        },
      ]);
      
      // {
      //   "device_id": "9454C562BD9C",
      //   "rules": [
      //       {
      //       "topic": "/tempSensor",
      //       "condition": "value <= 25",
      //       "pin": 2,
      //       "action": "off"
      //       },
      //       {
      //       "topic": "/tempSensor",
      //       "condition": "value > 25",
      //       "pin": 2,
      //       "action": "on"
      //       }
      //   ]
      //   }
        
      


  return (
    <>
<form onSubmit={(e) => handleSubmit(e, deviceId, forms)}>
  {forms.map((form, index) => (
    <div key={index} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '10px' }}>
      <label>Rule Type:</label>
      <select
        name="type"
        value={form.type}
        onChange={(e) => handleFormChange(index, e, forms, setForms)}
      >
        <option value="control">Control</option>
        <option value="reading">Reading</option>
      </select>

      <label>Topic:</label>
      <input
        type="text"
        name="topic"
        value={form.topic}
        onChange={(e) => handleFormChange(index, e, forms, setForms)}
        required
      />

      {form.type === 'control' && (
        <>
          <label>Condition:</label>
          <select
            name="condition"
            value={form.condition}
            onChange={(e) => handleFormChange(index, e, forms, setForms)}
            required
          >
            <option value="">Select</option>
            <option value="value ==">Equal to</option>
            <option value="value >">Greater than</option>
            <option value="value >=">Greater than or equal to</option>
            <option value="value <">Less than</option>
            <option value="value <=">Less than or equal to</option>
          </select>

          <label>Value:</label>
          <input
            type="number"
            name="value"
            value={form.value}
            onChange={(e) => handleFormChange(index, e, forms, setForms)}
            required
          />

          <label>Pin:</label>
          <input
            type="number"
            name="pin"
            value={form.pin}
            onChange={(e) => handleFormChange(index, e, forms, setForms)}
            required
          />

          <label>Action:</label>
          <select
            name="action"
            value={form.action}
            onChange={(e) => handleFormChange(index, e, forms, setForms)}
            required
          >
            <option value="">Select action</option>
            <option value="on">On</option>
            <option value="off">Off</option>
            <option value="pwm">PWM</option>
          </select>
        </>
      )}

      {form.type === 'reading' && (
        <>
          <label>Sensor:</label>
          <select
            name="sensor"
            value={form.sensor || ''}
            onChange={(e) => handleFormChange(index, e, forms, setForms)}
          >
            <option value="">Select sensor</option>
            <option value="dht11">DHT11</option>
            <option value="analog">Analog</option>
          </select>
          <label>Pin:</label>
          <input
            type="number"
            name="pin"
            value={form.pin}
            onChange={(e) => handleFormChange(index, e, forms, setForms)}
            required
          />

          <label>Interval (ms):</label>
          <input
            type="number"
            name="interval"
            value={form.interval}
            onChange={(e) => handleFormChange(index, e, forms, setForms)}
            required
          />
        </>
      )}

      <button type="button" onClick={() => removeForm(index, forms, setForms)}>Remove</button>
    </div>
  ))}

  <button type="button" onClick={() => handleAddForm(setForms)}>Add Rule</button>
  <button type="submit">Submit All</button>
</form>

  </>
  )
}

export default RuleForm