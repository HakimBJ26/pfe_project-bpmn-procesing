import { useState } from 'react';

const useNotification = (defaultDuration = 1000) => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const showNotification = (
    duration: number = defaultDuration,
    title: string = '',
    description: string = ''
  ) => {
    setTitle(title); // Set the title
    setDescription(description); // Set the description
    setShow(true); // Show the notification

    // Hide the notification after the specified duration
    setTimeout(() => {
      setShow(false);
    }, duration);
  };

  return { show, setShow, title, description, showNotification };
};

export default useNotification;