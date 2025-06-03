



const handleAddForm = (setForms) => {
  setForms(prev => [
    ...prev,
    {
      type: 'control',
      topic: '',
      condition: '',
      value: '',
      pin: '',
      action: '',
      interval: '',
      sensor: '',
    },
  ]);
};

const removeForm = (index, forms, setForms) => {
    setForms(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormChange = (index, e, forms, setForms) => {
    const { name, value } = e.target;
    const updatedForms = [...forms];
    updatedForms[index][name] = value;
    setForms(updatedForms);
  };
  
  
  

  const handleAddRule = () => {
    const conditionString = `${formData.condition} ${formData.value}`;
  
    const newRule = {
      topic: formData.topic,
      condition: conditionString,
      pin: parseInt(formData.pin),
      action: formData.action,
    };
  
    setRules(prev => [...prev, newRule]);
  
    // // clear the form
    // setFormData({
    //   topic: '',
    //   condition: '',
    //   value: '',
    //   pin: '',
    //   action: '',
    // });
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e, deviceId, forms) => {
    e.preventDefault();
  
    const rules = forms.map(f => {
      if (f.type === 'control') {
        return {
          type: 'control',
          topic: f.topic,
          condition: `${f.condition} ${f.value}`,
          pin: parseInt(f.pin),
          action: f.action,
        };
      } else if (f.type === 'reading') {
        return {
          type: 'reading',
          topic: f.topic,
          sensor: f.sensor || 'generic',
          pin: parseInt(f.pin),
          interval: parseInt(f.interval),
        };
      }
    });
  
    const payload = {
      device_id: deviceId,
      rules,
    };
  
    try {
      const response = await fetch('http://localhost:5000/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        console.log('Rules submitted successfully!');
      } else {
        console.error('Failed to submit rules');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  

  export { handleAddForm, handleFormChange, handleAddRule, handleChange, handleSubmit, removeForm };