'use client'

import { getGrades } from '@/app/actions/getGrades';
import { useEffect, useState } from 'react';

export function GradeOptions() {
  const [gradeOptions, setGradeOptions] = useState([]);

  useEffect(() => {
    getGrades().then(grades => {
      const options = Object.entries(grades).map(([id, name]) => (
        <option key={id} value={id}>{name}</option>
      ));
      setGradeOptions(options);
    }).catch(error => console.error(error));
  }, []);

  return (
    <>
    {gradeOptions}
    </>
  );
}
