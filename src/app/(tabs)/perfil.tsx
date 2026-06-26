// app/(tabs)/perfil.tsx
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';

// Validación de teléfono provisional — el backlog (T-41) no especifica el
// formato exacto. Exige al menos 10 caracteres entre dígitos/espacios/+/-/().
// Fácil de ajustar cuando se confirme la regla real con el backend.
function telefonoEsValido(telefono: string): boolean {
  return /^[0-9+\-\s()]{10,}$/.test(telefono.trim());
}

export default function PantallaPerfil() {
  const { usuario, cerrarSesion, actualizarUsuario } = useAuth();

  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombreEditado, setNombreEditado] = useState(usuario?.nombre ?? '');
  const [telefonoEditado, setTelefonoEditado] = useState(usuario?.telefono ?? '');

  if (!usuario) {
    // No debería pasar dentro de (tabs) — Stack.Protected ya garantiza sesión.
    // Guardia defensiva solo por seguridad de tipos.
    return (
      <SafeAreaView style={styles.contenedor}>
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  function iniciarEdicion() {
    if (!usuario) return; // guard local: TS no propaga el narrowing de arriba hacia esta closure
    setNombreEditado(usuario.nombre);
    setTelefonoEditado(usuario.telefono);
    setError(null);
    setEditando(true);
  }

  function cancelarEdicion() {
    setError(null);
    setEditando(false);
  }

  async function guardarCambios() {
    const nombreLimpio = nombreEditado.trim();

    if (nombreLimpio.length === 0) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    if (!telefonoEsValido(telefonoEditado)) {
      setError('Ingresa un teléfono válido (mínimo 10 dígitos).');
      return;
    }

    setError(null);
    setGuardando(true);

    try {
      // ──────────────────────────────────────────────────────────────
      // MOCK TEMPORAL — eliminar/reemplazar cuando exista T-41
      // (PATCH /usuarios/perfil real). Simula latencia de red y éxito.
      await new Promise((resolve) => setTimeout(resolve, 600));
      // ──────────────────────────────────────────────────────────────

      await actualizarUsuario({ nombre: nombreLimpio, telefono: telefonoEditado.trim() });
      setEditando(false);
    } catch (err) {
      console.error('Error al guardar perfil (mock):', err);
      setError('Ocurrió un error al guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  function confirmarCerrarSesion() {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres cerrar tu sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => cerrarSesion() },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Mi perfil</Text>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Nombre</Text>
          {editando ? (
            <TextInput
              style={styles.input}
              value={nombreEditado}
              onChangeText={setNombreEditado}
              placeholder="Tu nombre"
              autoCapitalize="words"
            />
          ) : (
            <Text style={styles.valor}>{usuario.nombre}</Text>
          )}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Email</Text>
          <Text style={[styles.valor, styles.valorNoEditable]}>{usuario.email}</Text>
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Teléfono</Text>
          {editando ? (
            <TextInput
              style={styles.input}
              value={telefonoEditado}
              onChangeText={setTelefonoEditado}
              placeholder="Tu teléfono"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.valor}>{usuario.telefono}</Text>
          )}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {editando ? (
          <View style={styles.filaBotones}>
            <TouchableOpacity
              style={[styles.boton, styles.botonSecundario]}
              onPress={cancelarEdicion}
              disabled={guardando}
            >
              <Text style={styles.textoBotonSecundario}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, styles.botonPrimario]}
              onPress={guardarCambios}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoBotonPrimario}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.boton, styles.botonPrimario]} onPress={iniciarEdicion}>
            <Text style={styles.textoBotonPrimario}>Editar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.botonCerrarSesion} onPress={confirmarCerrarSesion}>
          <Text style={styles.textoCerrarSesion}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  campo: {
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  valor: {
    fontSize: 16,
    color: '#111',
  },
  valorNoEditable: {
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#c0392b',
    marginBottom: 12,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 12,
  },
  boton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPrimario: {
    backgroundColor: '#2563eb',
  },
  botonSecundario: {
    backgroundColor: '#f1f1f1',
  },
  textoBotonPrimario: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  textoBotonSecundario: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  botonCerrarSesion: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  textoCerrarSesion: {
    color: '#c0392b',
    fontWeight: '600',
    fontSize: 15,
  },
});