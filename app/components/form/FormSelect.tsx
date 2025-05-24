import { Select, SelectItem, SelectProps } from "@nextui-org/react";
import { Key } from "react";

interface OptionType {
  key: string;
  value: string;
  display_name: string;
}

interface FormSelectProps extends Omit<SelectProps, 'children'> {
  options: OptionType[] | any[];
  optionKey?: string;
  optionValue?: string;
  optionLabel?: string;
  setDataValue: (value: any) => void;
  dataValue: any;
  fieldName: string;
  isObject?: boolean;
  objectKey?: string;
}

export default function FormSelect({
  options = [],
  optionKey = 'key',
  optionValue = 'value',
  optionLabel = 'display_name',
  setDataValue,
  dataValue,
  fieldName,
  isObject = false,
  objectKey = '',
  ...props
}: FormSelectProps) {
  const handleSelectionChange = (keys: Set<Key> | Key) => {
    const selectedKey = Array.from(keys)[0];
    
    if (!selectedKey) return;

    if (isObject && objectKey) {
      const selectedItem = options.find(opt => opt[optionKey] === selectedKey);
      if (selectedItem) {
        setDataValue({
          ...dataValue,
          [fieldName]: selectedItem
        });
      }
    } else {
      setDataValue({
        ...dataValue,
        [fieldName]: selectedKey
      });
    }
  };

  // Get the selected key based on the field type
  const getSelectedKey = () => {
    if (!dataValue || !dataValue[fieldName]) return new Set();
    
    if (isObject) {
      return dataValue[fieldName]?._id 
        ? new Set([dataValue[fieldName]._id]) 
        : new Set();
    }
    
    return new Set([dataValue[fieldName]]);
  };

  return (
    <Select
      selectedKeys={getSelectedKey()}
      onSelectionChange={handleSelectionChange}
      classNames={{
        label: "font-nunito text-sm text-default-100",
        popoverContent: "z-[10000] bg-white shadow-sm dark:bg-default-50 border border-black/5 font-nunito",
        trigger: "shadow-sm border border-black/30 hover:border-b-primary hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-white max-w-full !bg-white"
      }}
      {...props}
    >
      {options.map((option) => (
        <SelectItem 
          key={option[optionKey] || option._id || option.key} 
          value={option[optionValue] || option._id || option.value}
        >
          {option[optionLabel] || option.name || option.display_name || option.firstName}
        </SelectItem>
      ))}
    </Select>
  );
}
