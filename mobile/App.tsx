import React, {useEffect, useState} from 'react';
import {View, Button, StyleSheet, Text} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
  User,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '1073660061425-af5vugbl2gkkst1b5j610qtfcp1peknv.apps.googleusercontent.com',
});

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSigninSucess, setIsSigninSucess] = useState(false);

  useEffect(() => {
    console.log('useEffect');

    GoogleSignin.configure();
  }, []);

  // Somewhere in your code
  const signIn = async () => {
    console.log('signIn');

    try {
      await GoogleSignin.hasPlayServices();
      console.log('hasPlayServices');

      const response = await GoogleSignin.signIn();
      console.log('GoogleSignin');

      if (isSuccessResponse(response)) {
        console.log('success', response.data);

        setUser(response.data);
        setIsSigninSucess(true);
      } else {
        console.log('cancelled');
        setIsSigninSucess(false);
        // sign in was cancelled by user
      }
    } catch (error) {
      console.log('error', error);
      
      setIsSigninSucess(false);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  };

  return (
    <View style={styles.container}>
      {isSigninSucess ? (
        <View>
          <Text>Welcome {user?.user.name}</Text>
        </View>
      ) : (
        <GoogleSigninButton
          style={{width: 192, height: 48}}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
