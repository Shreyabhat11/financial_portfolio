import re
import google.generativeai as genai
from app.core.config import settings
from app.services.ai_cache import get_cached_ai_response, set_cached_ai_response

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash-lite")


def _clean(text: str) -> str:
    """Remove markdown bold/italic markers and extra whitespace."""
    text = re.sub(r'\*{1,3}', '', text)       # remove * ** ***
    text = re.sub(r'#{1,6}\s*', '', text)     # remove ## headings
    text = re.sub(r'\n{3,}', '\n\n', text)    # collapse blank lines
    return text.strip()


def analyze_stock(stock_symbol: str, current_price: float, market_trend: str) -> str:

    cache_key = f"ai:{stock_symbol}:{market_trend}"

    cached = get_cached_ai_response(cache_key)
    if cached:
        return cached

    prompt = (
        f"Analyze {stock_symbol} (NSE India). Current price: ₹{current_price}. "
        f"Market trend: {market_trend}.\n\n"
        "Provide a concise analysis with these sections:\n"
        "Signal: BUY / SELL / HOLD\n"
        "Risk Level: Low / Medium / High\n"
        "Short-term Outlook (1-3 months):\n"
        "Long-term Outlook (1-2 years):\n"
        "Key Factors:\n"
        "Summary:\n\n"
        "Rules: Do NOT use any markdown symbols like *, **, #, or bullet dashes. "
        "Write in plain text only. Keep total response under 250 words."
    )
    try:
        response = model.generate_content(prompt)

        set_cached_ai_response(cache_key, {"analysis": response.text})

        return _clean(response.text)
    except Exception as e:
        return f"Analysis unavailable: {str(e)}"


def portfolio_health_analysis(portfolio_summary: str) -> str:

    cache_key = f"ai:portfolio_health:{hash(portfolio_summary)}"

    cached = get_cached_ai_response(cache_key)
    if cached:
        return cached
    prompt = (
        f"Analyze this Indian stock portfolio:\n{portfolio_summary}\n\n"
        "Provide:\n"
        "Health Score: (0-100)\n"
        "Diversification:\n"
        "Risk Level:\n"
        "Weaknesses:\n"
        "Suggestions:\n\n"
        "Rules: Do NOT use any markdown symbols like *, **, #, or bullet dashes. "
        "Plain text only. Under 200 words."
    )
    try:
        response = model.generate_content(prompt)
        set_cached_ai_response(cache_key, {"analysis": response.text})
        return _clean(response.text)
    except Exception as e:
        return f"Analysis unavailable: {str(e)}"
