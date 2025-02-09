import React, { useState } from 'react';
import { Plus, Settings, Eye, Code, Save, Trash2, GripVertical } from 'lucide-react';

const FormBuilder = () => {
  const [elements, setElements] = useState([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);

  const elementTypes = [
    {
      id: 'text',
      label: 'Text Input',
      icon: 'Aa',
      properties: {
        label: 'Text Field',
        placeholder: '',
        required: false,
        minLength: 0,
        maxLength: 100,
        defaultValue: '',
        pattern: '',
      }
    },
    {
      id: 'number',
      label: 'Number Input',
      icon: '123',
      properties: {
        label: 'Number Field',
        placeholder: '',
        required: false,
        min: '',
        max: '',
        step: 1,
        defaultValue: '',
      }
    },
    {
      id: 'select',
      label: 'Dropdown',
      icon: '▼',
      properties: {
        label: 'Select Field',
        required: false,
        options: [],
        defaultValue: '',
        multiple: false,
      }
    },
    {
      id: 'checkbox',
      label: 'Checkbox',
      icon: '☑',
      properties: {
        label: 'Checkbox Field',
        required: false,
        defaultChecked: false,
      }
    }
  ];

  const handleDragStart = (e, type) => {
    const elementType = elementTypes.find(t => t.id === type);
    setDraggedElement({
      id: `element-${Date.now()}`,
      type,
      properties: { ...elementType.properties }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedElement) {
      setElements([...elements, draggedElement]);
      setDraggedElement(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleElementDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleElementDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      const newElements = [...elements];
      const [removed] = newElements.splice(dragIndex, 1);
      newElements.splice(dropIndex, 0, removed);
      setElements(newElements);
    }
  };

  const updateElementProperty = (elementId, property, value) => {
    setElements(elements.map(el =>
      el.id === elementId
        ? { ...el, properties: { ...el.properties, [property]: value } }
        : el
    ));
  };

  const PropertyPanel = ({ element }) => {
    if (!element) return null;

    const renderPropertyInput = (key, value) => {
      switch (key) {
        case 'required':
        case 'multiple':
        case 'defaultChecked':
          return (
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateElementProperty(element.id, key, e.target.checked)}
              className="ml-2"
            />
          );
        case 'options':
          return (
            <div className="mt-2">
              <textarea
                value={Array.isArray(value) ? value.join('\n') : ''}
                onChange={(e) => updateElementProperty(
                  element.id,
                  'options',
                  e.target.value.split('\n').filter(Boolean)
                )}
                className="w-full p-2 border rounded"
                placeholder="One option per line"
                rows={4}
              />
            </div>
          );
        default:
          return (
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => updateElementProperty(
                element.id,
                key,
                typeof value === 'number' ? Number(e.target.value) : e.target.value
              )}
              className="w-full p-2 border rounded mt-1"
            />
          );
      }
    };

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        {Object.entries(element.properties).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            {renderPropertyInput(key, value)}
          </div>
        ))}
      </div>
    );
  };

  const PreviewElement = ({ element }) => {
    const { properties } = element;

    switch (element.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={properties.placeholder}
            defaultValue={properties.defaultValue}
            className="w-full p-2 border rounded"
            required={properties.required}
            minLength={properties.minLength}
            maxLength={properties.maxLength}
            pattern={properties.pattern}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            placeholder={properties.placeholder}
            defaultValue={properties.defaultValue}
            className="w-full p-2 border rounded"
            required={properties.required}
            min={properties.min}
            max={properties.max}
            step={properties.step}
          />
        );
      case 'select':
        return (
          <select
            className="w-full p-2 border rounded"
            required={properties.required}
            multiple={properties.multiple}
            defaultValue={properties.defaultValue}
          >
            {properties.options.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              required={properties.required}
              defaultChecked={properties.defaultChecked}
            />
            <span>{properties.label}</span>
          </div>
        );
      default:
        return <div>Unsupported element type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <header className="bg-white p-4 rounded-lg shadow mb-4">
          <h1 className="text-2xl font-bold">Formibuilder</h1>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center px-4 py-2 rounded ${activeTab === 'editor' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center px-4 py-2 rounded ${activeTab === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center px-4 py-2 rounded ${activeTab === 'code' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
            >
              <Code className="w-4 h-4 mr-2" />
              Code
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4">
          {/* Element Palette */}
          <div className="col-span-2 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Elements</h2>
            <div className="space-y-2">
              {elementTypes.map((type) => (
                <div
                  key={type.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type.id)}
                  className="w-full flex items-center p-2 hover:bg-gray-100 rounded cursor-move"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded mr-2">
                    {type.icon}
                  </span>
                  {type.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div
            className="col-span-7 bg-white p-4 rounded-lg shadow"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {activeTab === 'editor' && (
              <div className="space-y-4">
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    draggable
                    onDragStart={(e) => handleElementDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleElementDrop(e, index)}
                    className={`border p-4 rounded relative cursor-move ${selectedElement?.id === element.id ? 'border-blue-500' : ''
                      }`}
                    onClick={() => setSelectedElement(element)}
                  >
                    <div className="flex items-center">
                      <GripVertical className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="flex-grow">{element.properties.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setElements(elements.filter(el => el.id !== element.id));
                          if (selectedElement?.id === element.id) {
                            setSelectedElement(null);
                          }
                        }}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <PreviewElement element={element} />
                  </div>
                ))}
                {elements.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded">
                    Drag elements here to build your form
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-4">
                {elements.map((element) => (
                  <div key={element.id} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {element.properties.label}
                      {element.properties.required && <span className="text-red-500">*</span>}
                    </label>
                    <PreviewElement element={element} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'code' && (
              <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
                <code>
                  {JSON.stringify(elements, null, 2)}
                </code>
              </pre>
            )}
          </div>

          {/* Properties Panel */}
          <div className="col-span-3">
            {activeTab === 'editor' && selectedElement && (
              <PropertyPanel element={selectedElement} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;