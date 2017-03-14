// @flow
import React from 'react';
import buttonsMessages from '../../common/messages/buttons';
import { Button } from '../../common/components';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { signOut } from '../../common/modules/auth';

type SignOutProps = {
  signOut: typeof signOut,
};

const SignOut = ({ signOut }: SignOutProps) => (
  <FormattedMessage {...buttonsMessages.signOut}>
    {message => (
      <Button primary onPress={signOut}>
        {message}
      </Button>
    )}
  </FormattedMessage>
);

export default connect(null, { signOut })(SignOut);
