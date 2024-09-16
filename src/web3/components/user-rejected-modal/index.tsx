import React from 'react';

import Modal, { ModalProps } from 'components/antd/modal';
import warning from 'resources/svg/warning-3.svg';
import { Text } from 'components/custom/typography';

const UserRejectedModal: React.FC<ModalProps> = props => {
  const { ...modalProps } = props;

  return (
    <Modal width={315} {...modalProps}>
      <div className="flex flow-row">
        <div className="flex flow-row align-center mb-32">
          <img
            width={16}
            height={16}
            src={warning}
            alt="etherscan link img"
            style={{ width: '110px', height: '128px' }}
          />{' '}
          <Text type="h3" weight="semibold" color="primary" className="mb-8">
            Error
          </Text>
          <Text type="p2" weight="semibold" color="secondary">
            Transaction rejected
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default UserRejectedModal;
