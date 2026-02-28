from rest_framework import serializers

class LabTestsTypeSerializer(serializers.Serializer):
    test_name = serializers.CharField(max_length=120)
    category = serializers.CharField(required=False, allow_blank=True)
    normal_range = serializers.CharField()
    method = serializers.FloatField(required=False)
    is_active = serializers.BooleanField(default=True) 
    
class OrderEventSerializer(serializers.Serializer):
    lab_order_id = serializers.IntegerField()        # ID de Pedido (Postgres)
    event_type = serializers.CharField()
    source = serializers.CharField() # ObjectId (string) de menus_types
    note = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateField(required=False)    # Ej: 2026-02-04
