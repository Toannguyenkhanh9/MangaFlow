import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import {useAppPreferences} from '../context/AppPreferencesContext';

type Props = {
  uri: string;
};

const screenWidth = Dimensions.get('window').width;

export default function PageImage({uri}: Props) {
  const {colors} = useAppPreferences();
  const [height, setHeight] = useState(screenWidth * 1.45);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Image.getSize(
      uri,
      (width, imageHeight) => {
        const ratio = imageHeight / width;
        setHeight(screenWidth * ratio);
      },
      () => {
        setHeight(screenWidth * 1.45);
      },
    );
  }, [uri]);

  return (
    <View style={[styles.container, {height}]}>
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loading}
        />
      )}

      <Image
        source={{uri}}
        style={[styles.image, {height}]}
        resizeMode="contain"
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    backgroundColor: '#000000',
  },
  image: {
    width: screenWidth,
  },
  loading: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    zIndex: 2,
  },
});
