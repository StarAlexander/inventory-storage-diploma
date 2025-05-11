from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.serialization import load_pem_private_key,load_pem_public_key
import base64


def sign_document(data: bytes, private_key_pem: str):
    """Подписать данные приватным ключом в формате PEM"""
    private_key = load_pem_private_key(private_key_pem.encode(), password=None)
    signature = private_key.sign(data, ec.ECDSA(hashes.SHA256()))
    return base64.b64encode(signature).decode()

def verify_document(data: bytes, public_key_pem: str, signature_b64: str):
    """Проверка подписи документа"""
    from cryptography.exceptions import InvalidSignature
    try:
        public_key = load_pem_public_key(public_key_pem.encode())
        signature = base64.b64decode(signature_b64)
        public_key.verify(signature, data, ec.ECDSA(hashes.SHA256()))
        return {"valid": True}
    except InvalidSignature:
        return {"valid": False, "error": "Неверная подпись"}