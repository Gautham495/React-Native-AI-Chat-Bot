import {
  Platform,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';

const View =
  require('react-native/Libraries/Components/View/ViewNativeComponent').default;

import React, {useRef, useState} from 'react';

import EventSource from 'react-native-sse';

import 'react-native-url-polyfill/auto';

const screenWidth = Dimensions.get('screen').width;

const SSEStream = () => {
  const [sendLoader, setSendLoader] = useState(false);

  const eventSourceRef = useRef(null);

  const [text, setText] = useState('');

  const [answer, setAnswer] = useState('');

  const handleStreamClick = async () => {
    // directly from gpt not recomended

    // eventSourceRef.current = new EventSource(
    //   'https://api.openai.com/v1/chat/completions',
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${key}`,
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({
    //       model: 'gpt-4o',
    //       messages: [
    //         {
    //           role: 'system',
    //           content:
    //             'You are a helpful assistant answer. Do not answer in markdown.',
    //         },
    //         {
    //           role: 'user',
    //           content: text,
    //         },
    //       ],
    //       stream: true,
    //     }),
    //   },
    // );

    // directly from your own sse enabled api

    eventSourceRef.current = new EventSource(
      'your_api',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          text: text,
        }),
      },
    );

    setText('');

    let textValue = '';

    eventSourceRef.current.addEventListener('message', async event => {
      try {
        if (event?.data === '[DONE]') {
          handleStopStream();
          setSendLoader(false);
        } else {
          const data = JSON.parse(event.data);

          if (
            data?.object === 'chat.completion.chunk' &&
            data?.choices[0]?.delta?.content
          ) {
            textValue = textValue + data?.choices[0]?.delta?.content;

            setAnswer(textValue);
          }
        }
      } catch (error) {}
    });
  };

  const handleStopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const handleSend = async () => {
    try {
      setSendLoader(true);
      await handleStreamClick();
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const onTextChange = v => {
    setText(v);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowContainer}>
        <View style={styles.inputContainer}>
          <View>
            <TextInput
              multiline
              value={text}
              onChangeText={onTextChange}
              style={styles.textInput}
              placeholder="Ask a question..."
              placeholderTextColor={'black'}
            />
          </View>

          <View>
            {sendLoader ? (
              <ActivityIndicator size={'small'} color={'black'} />
            ) : (
              <Pressable
                onPress={handleSend}
                hitSlop={{top: 20, bottom: 50, left: 20, right: 20}}>
                <Image source={require('./Send.png')} style={styles.sendIcon} />
              </Pressable>
            )}
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{}}>
          {answer?.length >= 1 && (
            <View
              style={{
                backgroundColor: '#15202B',
                borderRadius: 20,
                margin: 10,
                padding: 25,
                width: screenWidth * 0.85,
                maxWidth: screenWidth * 0.85,
                marginVertical: 15,
                marginLeft: 0,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 40,
                  color: 'white',
                }}>
                {answer}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SSEStream;

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    backgroundColor: 'white',
  },

  rowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  iconContainer: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -55,
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },

  sendIcon: {
    width: 25,
    height: 25,
    marginTop: Platform.OS === 'android' ? -7 : -2,
  },

  textInput: {
    borderWidth: 0.5,
    paddingTop: 12,
    padding: 12,
    width: screenWidth * 0.9,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    color: 'black',
    paddingRight: 45,
    maxHeight: 120,
  },
  inputContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 7,
    alignItems: 'flex-end',
  },
});
