from barcode import Code128
from barcode.writer import ImageWriter
from io import BytesIO
import base64



def generate_barcode(inventory_number: str) -> str:
    """
    Генерирует изображение штрих-кода из инвентарного номера
    """

    # Генерация штрих-кода
    ean = Code128(inventory_number,writer=ImageWriter())
    buffer = BytesIO()
    ean.write(buffer)

    # Преобразование в base64
    barcode_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{barcode_base64}"