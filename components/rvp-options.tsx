'use client'

import { getRVPsWithMiscellaneous } from '@/app/actions/getRVPsWithMiscellaneous';
import { useEffect, useState } from 'react';

export function RVPOptions({ startFilter = '', containFilter = 0 }: { startFilter?: string, containFilter?: number }) {
  const [RVPOptions, setRVPOptions] = useState([]);


  useEffect(() => {
    getRVPsWithMiscellaneous(startFilter, containFilter).then(RVPs => {
      const options = Object.entries(RVPs).map(([code, name]) => (
        <option key={code} value={code}>{name}</option>
      ));
      setRVPOptions(options);
    }).catch(error => console.error(error));
  }, [startFilter, containFilter]);

  return (
    <>
    {RVPOptions}
    </>
  );
}
