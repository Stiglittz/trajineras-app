import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput
} from 'react-native';
import { z } from 'zod';

// Ajusta esto en tu .env (variable EXPO_PUBLIC_API_URL).
// Si pruebas en tu teléfono físico, "localhost" NO funciona —
// necesitas la IP de tu computadora en la red local (ej. 192.168.x.x).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { iniciarSesion } = useAuth();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(datos: LoginForm) {
    setErrorServidor(null);
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (response.status === 401) {
        setErrorServidor('Credenciales incorrectas');
        return;
      }

      if (!response.ok) {
        setErrorServidor('Ocurrió un error. Intenta de nuevo.');
        return;
      }

      // Asumiendo contrato: { token: string, usuario: {...} }
      // Confirma con el backend que el shape real coincida.
      const { token, usuario } = await response.json();
      await iniciarSesion(token, usuario);
      router.replace('/');
    } catch (error) {
      setErrorServidor('No se pudo conectar al servidor.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Iniciar sesión</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            autoComplete="password"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      {errorServidor && <Text style={styles.error}>{errorServidor}</Text>}

      <Pressable
        style={[styles.boton, cargando && styles.botonDeshabilitado]}
        onPress={handleSubmit(onSubmit)}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Entrar</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/registro')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </Pressable>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
  },
  boton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: { textAlign: 'center', color: '#2563eb', marginTop: 12 },
});