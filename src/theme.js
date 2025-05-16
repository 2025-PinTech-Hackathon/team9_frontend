import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    colors: {
        brand: {
            black: '#000000',
            darkGray: '#222222',
            sky: '#A2DFFF',
            teal: '#1DCD9F',
            darkTeal: '#169976',
            gray: '#808080',
            warning: '#FFD700',
            primary: '#007bff',
            secondary: '#6c757d',
            success: '#28a745',
            danger: '#dc3545',
            info: '#17a2b8',
            light: '#f8f9fa',
            dark: '#343a40',
            red: '#FF0000',
            blue: '#0000FF',
        },
    },
    styles: {
        global: {
            body: {
                bg: 'brand.darkTeal',
            },
        },
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: 'bold',
                borderRadius: 'md',
            },
            variants: {
                solid: {
                    bg: 'brand.teal',
                    color: 'white',
                    _hover: {
                        bg: 'brand.darkTeal',
                    },
                },
                ghost: {
                    color: 'brand.darkTeal',
                    _hover: {
                        bg: 'rgba(255, 255, 255, 0.1)',
                        color: 'black',
                    },
                },
            },
            defaultProps: {
                colorScheme: 'brand',
            },
        },
    },
})

export default theme 