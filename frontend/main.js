const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
document.getElementById('api-url').textContent = apiUrl;

fetch(`${apiUrl}/dominios`)
  .then((r) => r.json())
  .then((data) => {
    console.log('Domínios carregados da API:', data);
  })
  .catch((err) => {
    console.warn('API indisponível (normal se o backend não estiver no ar):', err);
  });
