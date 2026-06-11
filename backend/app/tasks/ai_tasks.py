from app.core.celery import celery
from app.services.ai_service import analyze_stock


@celery.task
def generate_stock_analysis(symbol, price, trend):
    return analyze_stock(symbol, price, trend)