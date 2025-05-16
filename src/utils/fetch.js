const TIMEOUT_DURATION = 10000; // 10초

export const customFetch = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
            // 401 에러 발생 시 로그인 페이지로 리다이렉트
            localStorage.removeItem('access_token');
            window.location.href = '/login';
            throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
        }
        throw error;
    }
}; 