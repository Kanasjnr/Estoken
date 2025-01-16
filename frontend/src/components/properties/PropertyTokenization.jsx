import React, { useState } from 'react';
import { useESToken } from '../../context/ESTokenContext';
import useTokenizeProperty from '../../hooks/useTokenizeProperty';

const PropertyTokenization = () => {
  const { isInitialized } = useESToken();
  const { tokenizeProperty, loading, error } = useTokenizeProperty();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    imageUrls: [''],
    totalShares: '',
    pricePerShare: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData(prevState => ({
      ...prevState,
      imageUrls: newImageUrls
    }));
  };

  const addImageUrl = () => {
    setFormData(prevState => ({
      ...prevState,
      imageUrls: [...prevState.imageUrls, '']
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isInitialized) {
      alert('Please connect to Base Sepolia Testnet');
      return;
    }

    try {
      await tokenizeProperty(
        formData.name,
        formData.location,
        formData.description,
        formData.imageUrls.filter(url => url !== ''),
        formData.totalShares,
        formData.pricePerShare
      );
      // Reset form after successful submission
      setFormData({
        name: '',
        location: '',
        description: '',
        imageUrls: [''],
        totalShares: '',
        pricePerShare: ''
      });
    } catch (err) {
      console.error('Error tokenizing property:', err);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Tokenize Property</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          ></textarea>
        </div>
        <div>
          <label className="block mb-1">Image URLs:</label>
          {formData.imageUrls.map((url, index) => (
            <input
              key={index}
              type="url"
              value={url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
            />
          ))}
          <button type="button" onClick={addImageUrl} className="text-blue-500">
            + Add another image URL
          </button>
        </div>
        <div>
          <label className="block mb-1">Total Shares:</label>
          <input
            type="number"
            name="totalShares"
            value={formData.totalShares}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Price Per Share (in ETH):</label>
          <input
            type="number"
            step="0.000001"
            name="pricePerShare"
            value={formData.pricePerShare}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading }
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Tokenize Property'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default PropertyTokenization;