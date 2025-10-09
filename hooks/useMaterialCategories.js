// hooks/useMaterialCategories.ts
import { useState, useEffect } from 'react';
import { mockMaterialCategories } from '../data/mockClinicalMaterials';
const useMaterialCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setCategories(mockMaterialCategories);
            setIsLoading(false);
        }, 1000); // Simulate network delay
        return () => clearTimeout(timer);
    }, []);
    return { categories, isLoading };
};
export default useMaterialCategories;
