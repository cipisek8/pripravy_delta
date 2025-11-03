'use client'

import { useEffect, useState } from 'react';
import { getFields } from '@/app/actions/getFields';

export function FieldOptions() {
  const [fieldOptions, setFieldOptions] = useState([]);

  useEffect(() => {
    getFields().then(fields => {
      const options = Object.entries(fields).map(([id, name]) => (
        <option key={id} value={id}>{name}</option>
      ));
      setFieldOptions(options);
    }).catch(error => console.error(error));
  }, []);

  return (
    <>
    {fieldOptions}
    </>
  );
}
