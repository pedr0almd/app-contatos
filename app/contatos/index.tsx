import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import api, { loadAuthToken, getImageUrl } from '../../lib/api';
import { global } from '../../styles/global';
import { Contato } from '../../types/Contato';

export default function ListaContatos() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const router = useRouter();

  const carregar = useCallback(async () => {
    try {
      await loadAuthToken();
      const { data } = await api.get('/contatos');
      setContatos(data);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao carregar contatos. Verifique login e API.');
    }
  }, []);

  const excluir = async (id: string) => {
    try {
      await api.delete(`/contatos/${id}`);
      carregar();
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  return (
    <View style={global.container}>
      <Text style={global.title}>Seus contatos</Text>
      <Button
        title="Novo contato"
        onPress={() => router.push('/contatos/novo')}
      />
      <FlatList
        data={contatos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/contatos/${item._id}`)}>
            <Text>{item.nome}</Text>
            {item.fotoId && (
              <Image
                source={{ uri: getImageUrl(item.fotoId) }}
                style={{ width: 100, height: 100, marginVertical: 8 }}
              />
            )}
            <Button title="Excluir" onPress={() => excluir(item._id)} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
