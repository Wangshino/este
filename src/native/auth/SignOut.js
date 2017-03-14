// @flow
import React from 'react';
import buttonsMessages from '../../common/messages/buttons';
import { Button } from '../../common/components';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { signOut } from '../../common/modules/auth';

type SignOutProps = { signOut: typeof signOut };
type SignOutContext = { router: Object };

const SignOut = ({ signOut }: SignOutProps, { router }: SignOutContext) => {
  const onPress = () => {
    // We have to redirect to home before signOut.
    router.transitionTo({ pathname: '/' });
    // TODO: Router should provide onCompleted callback.
    setImmediate(signOut);
  };
  return (
    <FormattedMessage {...buttonsMessages.signOut}>
      {message => <Button danger onPress={onPress}>{message}</Button>}
    </FormattedMessage>
  );
};

SignOut.contextTypes = {
  router: React.PropTypes.object,
};

// $FlowFixMe SignOut Context does it.
export default connect(null, { signOut })(SignOut);
