import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Flex, Loading } from '@aptible/arrow-ds';

import { selectLoader } from '@app/loaders';
import { loginUrl } from '@app/routes';
import { selectIsUserAuthenticated, fetchCurrentToken } from '@app/token';

import { LogoutButton } from '../auth/logout-button';

export const AuthRequired = () => {
  const loader = useSelector(selectLoader(`${fetchCurrentToken}`));
  const isAuthenticated = useSelector(selectIsUserAuthenticated);

  if (loader.lastRun > 0 && !loader.isLoading && !isAuthenticated) {
    return <Navigate to={loginUrl()} />;
  }

  if (loader.isLoading) {
    return (
      <Flex className="w-full h-full items-center justify-center">
        <Loading />
      </Flex>
    );
  }

  return (
    <Box>
      <Outlet />
      <LogoutButton />
    </Box>
  );
};
