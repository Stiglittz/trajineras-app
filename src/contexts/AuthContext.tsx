// contexts/AuthContext.tsx
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol?: string;
}

interface JWTPayload {
  exp: number;
  [key: string]: any;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  iniciarSesion: (token: string, usuario: Usuario) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: (datos: Partial<Usuario>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Revisa localmente si el token sigue vigente (sin verificar firma,
// solo lee el campo "exp" — la verificación de firma la hace el backend).
function tokenEsValido(token: string): boolean {
  try {
    const payload = jwtDecode<JWTPayload>(token);
    const ahoraEnSegundos = Date.now() / 1000;
    return payload.exp > ahoraEnSegundos;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarSesionGuardada();
  }, []);

  async function cargarSesionGuardada() {
    try {
      const tokenGuardado = await SecureStore.getItemAsync(TOKEN_KEY);

      if (!tokenGuardado) {
        setIsLoading(false);
        return;
      }

      if (!tokenEsValido(tokenGuardado)) {
        // Token expirado o corrupto: limpiar para que Splash mande a /login
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        setIsLoading(false);
        return;
      }

      const usuarioGuardadoRaw = await SecureStore.getItemAsync(USER_KEY);
      setToken(tokenGuardado);
      setUsuario(usuarioGuardadoRaw ? JSON.parse(usuarioGuardadoRaw) : null);
    } catch (error) {
      console.error('Error al cargar sesión guardada:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function iniciarSesion(nuevoToken: string, nuevoUsuario: Usuario) {
    await SecureStore.setItemAsync(TOKEN_KEY, nuevoToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }

  async function cerrarSesion() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setToken(null);
    setUsuario(null);
  }

  async function actualizarUsuario(datosActualizados: Partial<Usuario>) {
    if (!usuario) return;
    const usuarioActualizado = { ...usuario, ...datosActualizados };
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, token, isLoading, iniciarSesion, cerrarSesion, actualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}