import { useState } from 'react';
import { api } from './api/axios';
import { tokenStorage } from './api/tokenStorage';

export function App() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleAuth = async (endpoint: '/auth/signup' | '/auth/signin') => {
		setError(null);
		try {
			const { data } = await api.post<{ accessToken: string }>(endpoint, {
				email,
				password,
			});
			tokenStorage.set(data.accessToken);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Error');
		}
	};

	return (
		<div
			style={{ maxWidth: 400, margin: '50px auto', fontFamily: 'sans-serif' }}
		>
			<h2>JWT + HttpOnly Cookies</h2>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
				<input
					type='email'
					placeholder='Email'
					value={email}
					onChange={e => setEmail(e.target.value)}
					style={{ padding: 8 }}
				/>
				<input
					type='password'
					placeholder='Password'
					value={password}
					onChange={e => setPassword(e.target.value)}
					style={{ padding: 8 }}
				/>
				<div style={{ display: 'flex', gap: 10 }}>
					<button
						onClick={() => handleAuth('/auth/signup')}
						style={{ flex: 1, padding: 8 }}
					>
						Register
					</button>
					<button
						onClick={() => handleAuth('/auth/signin')}
						style={{ flex: 1, padding: 8 }}
					>
						Login
					</button>
				</div>
			</div>

			{error && <p style={{ color: 'red' }}>{error}</p>}
		</div>
	);
}

export default App;
