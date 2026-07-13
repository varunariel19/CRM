using System.Security.Cryptography;
using System.Text;

namespace ArielCRM.Infrastructure.Services
{
    public class EncryptionService
    {
      
        private const int SaltSize = 16;        
        private const int KeySize = 32;         
        private const int NonceSize = 12;        
        private const int TagSize = 16;          
        private const int Iterations = 210_000; 

        public static byte[] GenerateSalt()
        {
            return RandomNumberGenerator.GetBytes(SaltSize);
        }

        private static byte[] DeriveKey(string password, byte[] salt)
        {
            return Rfc2898DeriveBytes.Pbkdf2(
                password: Encoding.UTF8.GetBytes(password),
                salt: salt,
                iterations: Iterations,
                hashAlgorithm: HashAlgorithmName.SHA256,
                outputLength: KeySize
            );
        }

        public static byte[] EncryptPrivateKey(byte[] privateKeyBytes, string password, byte[] salt)
        {
            byte[] derivedKey = DeriveKey(password, salt);

            byte[] nonce = RandomNumberGenerator.GetBytes(NonceSize);
            byte[] ciphertext = new byte[privateKeyBytes.Length];
            byte[] tag = new byte[TagSize];

            using (var aesGcm = new AesGcm(derivedKey, TagSize))
            {
                aesGcm.Encrypt(nonce, privateKeyBytes, ciphertext, tag);
            }

            byte[] result = new byte[NonceSize + ciphertext.Length + TagSize];
            Buffer.BlockCopy(nonce, 0, result, 0, NonceSize);
            Buffer.BlockCopy(ciphertext, 0, result, NonceSize, ciphertext.Length);
            Buffer.BlockCopy(tag, 0, result, NonceSize + ciphertext.Length, TagSize);

            Array.Clear(derivedKey, 0, derivedKey.Length); 
            return result;
        }

        public static byte[] DecryptPrivateKey(byte[] encryptedBlob, string password, byte[] salt)
        {
            byte[] derivedKey = DeriveKey(password, salt);

            byte[] nonce = new byte[NonceSize];
            byte[] tag = new byte[TagSize];
            int ciphertextLength = encryptedBlob.Length - NonceSize - TagSize;
            byte[] ciphertext = new byte[ciphertextLength];

            Buffer.BlockCopy(encryptedBlob, 0, nonce, 0, NonceSize);
            Buffer.BlockCopy(encryptedBlob, NonceSize, ciphertext, 0, ciphertextLength);
            Buffer.BlockCopy(encryptedBlob, NonceSize + ciphertextLength, tag, 0, TagSize);

            byte[] plaintext = new byte[ciphertextLength];

            using (var aesGcm = new AesGcm(derivedKey, TagSize))
            {
                aesGcm.Decrypt(nonce, ciphertext, tag, plaintext);
            }

            Array.Clear(derivedKey, 0, derivedKey.Length); 
            return plaintext;
        }

}

}



