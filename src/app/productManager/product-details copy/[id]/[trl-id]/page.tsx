"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from 'react';

export default function TRLDetails() {
  const params = useParams();
  const productId = params.id as string;
  const trlId = params['trl-id'] as string;

  useEffect(() => {
    console.log('Product ID:', productId);
    console.log('TRL ID:', trlId);
    
    // You can now use these IDs to fetch specific TRL details
    const fetchTRLDetails = async () => {
      try {
        const response = await fetch(`/api/trl-level?productId=${productId}&trlId=${trlId}`);
        const data = await response.json();
        console.log('TRL details:', data);
        // Handle the data as needed
      } catch (error) {
        console.error('Error fetching TRL details:', error);
      }
    };

    fetchTRLDetails();
  }, [productId, trlId]);

  return (
    <div>
      
    </div>
  );
}