# App Contatos com Auth - Expo + TypeScript + Expo Router

Implementação do guia **"App Contatos com Auth v3"** (API v2 com GridFS).
Gerenciador de contatos com autenticação JWT, CRUD completo e upload de fotos.

## Como rodar

```bash
npm install     # já executado
npx expo start  # depois: a = Android, i = iOS, w = Web
```

Antes de testar, suba a **API v2** com estas rotas:

| Rota | Uso |
| --- | --- |
| `POST /usuarios/registrar` | cadastro |
| `POST /usuarios/login` | devolve `{ token }` (JWT) |
| `GET/POST/PUT/DELETE /contatos` | CRUD (exige `Authorization: Bearer`) |
| `POST /upload` | multipart, campo `foto` → `{ fileId }` |
| `GET /upload/:id` | stream da imagem no GridFS |

## BASE_URL

Fica em `lib/api.ts`. Hoje esta fixa no IP do PC na LAN (`http://192.168.18.223:3000`),
que e a estrategia (A) do guia e funciona em celular fisico via Expo Go.

Se trocar de rede ou de alvo, ajuste conforme a plataforma:

| Onde roda | URL |
| --- | --- |
| Celular fisico (Expo Go) | `http://IP_DO_PC:3000` |
| Android emulador (AVD) | `http://10.0.2.2:3000` |
| iOS simulador | `http://localhost:3000` |
| Web | `http://localhost:3000` |

No celular fisico `localhost` e o proprio celular, nunca o PC.

## Estrutura

```
app/
  _layout.tsx        # Layout com guarda de autenticação
  index.tsx          # Login
  cadastro.tsx       # Cadastro de usuário
  contatos/
    index.tsx        # Lista de contatos
    novo.tsx         # Novo contato
    [id].tsx         # Editar contato
components/
  FormContato.tsx    # Formulário reutilizável (com upload e preview)
lib/
  api.ts             # Axios + token + helpers (SecureStore)
styles/
  global.ts          # Estilos básicos
types/
  Contato.ts         # Tipagem do contato (fotoId)
assets/
  placeholder.png    # Imagem opcional quando não há foto
```

## Teste guiado (roteiro de aula)

1. Registrar usuário - deixe o e-mail em branco de propósito e mostre a validação.
2. Login bem-sucedido. Para provar que o token veio do armazenamento seguro:
   `const t = await loadAuthToken(); console.log('token carregado?', !!t)`.
3. Criar contato **sem** imagem.
4. Editar o contato e enviar imagem → conferir o `fileId` no console da API.
5. Listar e ver a miniatura renderizando.
6. Excluir um contato e observar o recarregamento pelo listener de *focus*.

## FAQ

1. **A imagem não carrega no Android.** Use `10.0.2.2:3000` no emulador e teste
   `GET /upload/:id` no próprio dispositivo.
2. **Upload falha com 415/400.** Cheque `Content-Type: multipart/form-data` e o
   `name`/`type` do `FormData`.
3. **"Volta para login" depois de logar.** Garanta que o guard (`_layout.tsx`)
   chama `loadAuthToken()` antes de decidir.
4. **Remover foto.** Envie `fotoId: undefined` no `PUT` e trate no backend
   apagando o arquivo antigo (se desejado).
5. **Cache da imagem mudou?** Use `getImageUrl(fotoId) + '?t=' + Date.now()`
   após novo upload.

## Checklist de compatibilidade com a API v2 (GridFS)

- [x] Campo `fotoId` no tipo e nas telas.
- [x] Upload em `/upload` com campo `foto` (multipart) e `Authorization`.
- [x] Exibição via `GET /upload/{fotoId}`.
- [x] CRUD: `POST`/`PUT` enviam `fotoId` quando existir.
- [x] Token JWT persistido com SecureStore e aplicado no Axios.

## Observações da implementação

- **SecureStore não funciona no Web.** Login/CRUD devem ser demonstrados no
  Android/iOS; o Web serve para conferir a UI.
- `useFocusEffect` na lista está envolvido em `useCallback` - sem isso o efeito
  dispara em loop a cada render.
- `ImagePicker.MediaTypeOptions.Images` está deprecado no SDK 57; usamos
  `mediaTypes: ['images']`.
