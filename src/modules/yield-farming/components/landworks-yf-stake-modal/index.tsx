import React from 'react';

import Button from 'components/antd/button';
import Modal, { ModalProps } from 'components/antd/modal';
import Grid from 'components/custom/grid';
import Icon from 'components/custom/icon';
import { Text } from 'components/custom/typography';

export type LandWorksYfStakeModalProps = ModalProps & {
  hasUnclaimedRent: boolean;
};

const LandWorksYfStakeActionModal: React.FC<LandWorksYfStakeModalProps> = props => {
  const { hasUnclaimedRent, ...modalProps } = props;

  return (
    <Modal width={560} {...modalProps}>
      <Grid flow="row" gap={32}>
        <Grid flow="row" gap={16}>
          <Icon name="warning-outlined" width={40} height={40} color="red" />
          <Grid flow="row" gap={8}>
            <Text type="h3" weight="semibold" color="primary">
              Are you sure you want to execute this?
            </Text>
            {hasUnclaimedRent && (
              <Text type="p2" weight="semibold" color="secondary">
                <br />
                {hasUnclaimedRent ? 'One or more selected assets have unclaimed rent.' : ''}
                <br />
                {hasUnclaimedRent ? 'Executing this will transfer all the unclaimed rent to your address.' : ''}
              </Text>
            )}
          </Grid>
        </Grid>
        <Grid flow="col" justify="space-between">
          <Button type="default" onClick={modalProps.onCancel}>
            <span>Cancel</span>
          </Button>
          <Button type="primary" onClick={modalProps.onOk}>
            Yes
          </Button>
        </Grid>
      </Grid>
    </Modal>
  );
};

export default LandWorksYfStakeActionModal;
