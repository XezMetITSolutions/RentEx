
import React, { useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';

interface Props {
  onSave: (signature: string) => void;
  onClear: () => void;
  height?: number;
}

const SignaturePad = ({ onSave, onClear, height = 300 }: Props) => {
  const ref = useRef<SignatureViewRef>(null);

  const handleOK = (signature: string) => {
    onSave(signature);
  };

  const handleClear = () => {
    ref.current?.clearSignature();
    onClear();
  };

  const handleConfirm = () => {
    ref.current?.readSignature();
  };

  const style = `
    .m-signature-pad--footer {display: none; margin: 0px;}
    body,html {
      width: 100%; height: 100%;
    }
  `;

  return (
    <View style={[styles.container, { height }]}>
      <SignatureScreen
        ref={ref}
        onOK={handleOK}
        webStyle={style}
        descriptionText=""
        bgWidth={0}
        bgHeight={0}
      />
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={handleClear}>
          <Text style={styles.buttonText}>Löschen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={handleConfirm}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>Bestätigen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignaturePad;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  confirmBtn: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
});
