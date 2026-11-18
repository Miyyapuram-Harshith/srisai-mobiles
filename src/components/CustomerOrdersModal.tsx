import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CustomerOrdersModal has been migrated to the dedicated CustomerOrdersPage.
 * If opened, it seamlessly transitions the route to 'orders' and closes the popup modal.
 */
export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({ isOpen, onClose }) => {
  const { navigateTo } = useApp();

  useEffect(() => {
    if (isOpen) {
      navigateTo('orders');
      onClose();
    }
  }, [isOpen, navigateTo, onClose]);

  return null;
};

export { CustomerOrdersPage } from './CustomerOrdersPage';
