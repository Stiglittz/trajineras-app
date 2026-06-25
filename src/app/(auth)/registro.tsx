// src/app/(auth)/registro.tsx
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
    TextInput,
} from 'react-native';
import { z } from 'zod';

// Mismo placeholder que login.tsx — ajusta en .env cuando tengas la URL real.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const registroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  telefono: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(/^\d{10}$/, 'Debe tener 10 dígitos, sin espacios ni guiones'),
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z
    .string()
    .min(8, 'Debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
});

type RegistroForm = z.infer<typeof registroSchema>;

export default function RegistroScreen() {
  const { iniciarSesion } = useAuth();
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
    defaultValues: { nombre: '', telefono: '', email: '', password: '' },
  });

  async function onSubmit(datos: RegistroForm) {
    setErrorEmail(null);
    setErrorServidor(null);
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      // Asumido: 409 cuando el correo ya está registrado.
      // Confirma con el backend si usa otro código (ej. 400/422).
      if (response.status === 409) {
        setErrorEmail('Este correo ya está registrado');
        return;
      }

      if (!response.ok) {
        setErrorServidor('Ocurrió un error. Intenta de nuevo.');
        return;
      }

      // Auto-login tras registro exitoso. Mismo contrato asumido que en
      // login.tsx: { token, usuario }. Ajustar si el backend regresa otro shape.
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
      <Text style={styles.titulo}>Crear cuenta</Text>

      <Controller
        control={control}
        name="nombre"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            autoCapitalize="words"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.nombre && <Text style={styles.error}>{errors.nombre.message}</Text>}

      <Controller
        control={control}
        name="telefono"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Teléfono (10 dígitos)"
            keyboardType="number-pad"
            maxLength={10}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.telefono && <Text style={styles.error}>{errors.telefono.message}</Text>}

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
      {errorEmail && <Text style={styles.error}>{errorEmail}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
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
          <Text style={styles.botonTexto}>Registrarme</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
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
  link: {
    textAlign: 'center',
    color: '#2563eb',
    marginTop: 12,
  },
});