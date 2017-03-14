// @flow
import OnlineUsers from './OnlineUsers';
import React from 'react';
import linksMessages from '../../common/messages/links';
import { Box, PageHeader } from '../../common/components';
import { Title } from '../components';

const UsersPage = () => (
  <Box>
    <Title message={linksMessages.users} />
    <PageHeader heading="Users" description="Online users." />
    <OnlineUsers />
  </Box>
);

export default UsersPage;
