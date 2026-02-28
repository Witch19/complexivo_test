from django.db import models
from django.core.validators import MinValueValidator

class Test(models.Model):
    test_name = models.CharField(max_length=120)
    sample_type = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.IntegerField(validators=[MinValueValidator(0)])

    class Meta:
        db_table = "lab_tests"   # 👈 importante: mapea al nombre real de tu tabla

    def __str__(self):
        return f"{self.test_name} - {self.sample_type} (${self.price})"


class OrderStatus(models.TextChoices):
    CREATED = "CREATED", "CREATED"
    PROCESSING = "PROCESSING", "PROCESSING"
    COMPLETED = "COMPLETED", "COMPLETED"
    CANCELLED = "CANCELLED", "CANCELLED"

class Order(models.Model):
    test = models.ForeignKey(Test, on_delete=models.PROTECT, db_column="test_id")
    patient_name = models.CharField(max_length=120)
    status = models.CharField(max_length=20, choices=OrderStatus.choices)
    result_summary = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lab_orders"  # 👈 si tu tabla se llama así; si no, cámbialo

    def __str__(self):
        return f"{self.patient_name} - {self.test.test_name} ({self.status})"