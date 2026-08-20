import Select from 'react-select';

function ReactSelect({ value, onChange, options, placeholder = 'Chọn một mục', isInvalid = false, inputId, isClearable = false, ...props }) {
  const selected = options.find((option) => String(option.value) === String(value)) || null;

  return (
    <Select
      inputId={inputId}
      className={`hotel-react-select${isInvalid ? ' is-invalid' : ''}`}
      classNamePrefix="hotel-select"
      value={selected}
      options={options}
      onChange={(option) => onChange(option?.value ?? '')}
      placeholder={placeholder}
      isClearable={isClearable}
      noOptionsMessage={() => 'Không có lựa chọn'}
      {...props}
    />
  );
}

export default ReactSelect;
