import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select'; // Import React Select
import { useDropzone } from 'react-dropzone'; // Import React Dropzone

const CardForm = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    cardName: '',
    cardDescription: '',
    boardId: '',
    listId: '',
    labelId: '',
    loomVideoUrl: '',
    // imageUrl: '',
  });
  const [fileAttachments, setFileAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState('');

  // State to hold dynamic data
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    // Fetch boards on component mount
    fetchBoards();
  }, []);

  // Fetch Trello Boards
  const fetchBoards = async () => {
    try {
      const response = await axios.get('https://api.trello.com/1/members/me/boards', {
        params: {
          key: import.meta.env.VITE_TRELLO_API_KEY,
          token: import.meta.env.VITE_TRELLO_API_TOKEN,
        },
      });
      setBoards(response.data);
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError('There was an error fetching boards.');
    }
  };

  // Fetch Lists for a selected board
  const fetchLists = async (boardId) => {
    try {
      const response = await axios.get(`https://api.trello.com/1/boards/${boardId}/lists`, {
        params: {
          key: import.meta.env.VITE_TRELLO_API_KEY,
          token: import.meta.env.VITE_TRELLO_API_TOKEN,
        },
      });
      setLists(response.data);
      if (response.data.length > 0) {
        setFormData((prevData) => ({
          ...prevData,
          listId: response.data[0].id,
        }));
      }
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('There was an error fetching lists.');
    }
  };

  // Fetch Labels for a selected board (not list)
  const fetchLabels = async (boardId) => {
    try {
      const response = await axios.get(`https://api.trello.com/1/boards/${boardId}/labels`, {
        params: {
          key: import.meta.env.VITE_TRELLO_API_KEY,
          token: import.meta.env.VITE_TRELLO_API_TOKEN,
        },
      });
      setLabels(response.data);
    } catch (err) {
      console.error('Error fetching labels:', err);
      setError('There was an error fetching labels.');
    }
  };

  // Handle board selection
  const handleBoardChange = (selectedOption) => {
    const selectedBoardId = selectedOption ? selectedOption.value : '';
    setFormData({
      ...formData,
      boardId: selectedBoardId,
      listId: '', // Reset listId when changing the board
      labelId: '', // Reset labelId when changing the board
    });
    fetchLists(selectedBoardId); // Fetch lists for the selected board
    fetchLabels(selectedBoardId); // Fetch labels for the selected board
  };

  // Handle list selection
  const handleListChange = (selectedOption) => {
    setFormData({
      ...formData,
      listId: selectedOption ? selectedOption.value : '',
    });
  };

  // Handle label selection
  const handleLabelChange = (selectedOption) => {
    setFormData({
      ...formData,
      labelId: selectedOption ? selectedOption.value : '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file upload using react-dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFileAttachments((prevFiles) => [...prevFiles, ...acceptedFiles]); // Append files to the existing ones
    },
    multiple: true,
    accept: '.jpg,.jpeg,.png,.pdf', // Accept only image and pdf files
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotification('');

    const formDataWithFiles = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataWithFiles.append(key, formData[key]);
    });

    Array.from(fileAttachments).forEach((file) => {
      formDataWithFiles.append('fileAttachment', file);
    });

    try {
      const response = await axios.post('https://customerhub-server-m8avm.ondigitalocean.app/api/create-card', formDataWithFiles, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Card created successfully:', response.data);
      setShowModal(true);
      setFormData({
        userEmail: '',
        cardName: '',
        cardDescription: '',
        boardId: '',
        listId: '',
        labelId: '',
        loomVideoUrl: '',
        // imageUrl: '',
      });
      setFileAttachments([]);
      setNotification('Card created successfully!');
    } catch (err) {
      console.error('Error:', err);
      setError('There was an error creating the card.');
      setNotification(err.response.data.error.message);
    } finally {
      setLoading(false);
    }
  };

  // const handleCloseModal = () => {
  //   setShowModal(false);
  // };

  // Map Trello data to React Select options
  const boardOptions = boards.map((board) => ({
    value: board.id,
    label: board.name,
  }));

  const listOptions = lists.map((list) => ({
    value: list.id,
    label: list.name,
  }));

  const labelOptions = labels.map((label) => ({
    value: label.id,
    label: label.name,
  }));

  return (
    <div className="flex justify-center items-center p-14 min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg h-5/6">
        <h2 className="text-2xl font-semibold text-center mb-6">Create a Card In Trello</h2>

        {/* Notification for Success or Error */}
        {notification && (
          <div className={`mb-4 text-center p-3 rounded ${error ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            {notification}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userEmail" className="block text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="userEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              // required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="cardName" className="block text-gray-700">
              Card Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the card Title"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="cardDescription" className="block text-gray-700">
              Card Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cardDescription"
              name="cardDescription"
              value={formData.cardDescription}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a description"
              rows="4"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="boardId" className="block text-gray-700">
              Board <span className="text-red-500">*</span>
            </label>
            <Select
              id="boardId"
              name="boardId"
              value={boardOptions.find(option => option.value === formData.boardId)}
              onChange={handleBoardChange}
              options={boardOptions}
              placeholder="Select a Trello board"
              className="w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="listId" className="block text-gray-700">
              List <span className="text-red-500">*</span>
            </label>
            <Select
              id="listId"
              name="listId"
              value={listOptions.find(option => option.value === formData.listId) || listOptions[0]}
              onChange={handleListChange}
              options={listOptions}
              placeholder="Select a Trello list"
              className="w-full"
              // required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="labelId" className="block text-gray-700">Label<span className="text-red-500">*</span></label>
            <Select
              id="labelId"
              name="labelId"
              value={labelOptions.find(option => option.value === formData.labelId)}
              onChange={handleLabelChange}
              options={labelOptions}
              placeholder="Select a label"
              className="w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="loomVideoUrl" className="block text-gray-700">Loom Video URL</label>
            <input
              type="url"
              id="loomVideoUrl"
              name="loomVideoUrl"
              value={formData.loomVideoUrl}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Loom video URL"
            />
          </div>
          {/* <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-gray-700">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter image URL"
            />
          </div> */}
          <div className="mb-4">
            <label className="block text-gray-700">Attachments</label>
            <div {...getRootProps()} className="border-2 border-dashed p-4 mt-2 text-center cursor-pointer">
              <input {...getInputProps()} />
              <p>Drag & drop files here, or click to select files</p>
            </div>
            <ul className="mt-2">
              {fileAttachments.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardForm;

