from typing import Optional, Dict, Any
from openai import OpenAI
from app.config import settings
import json

class AIService:
    """Service for AI-powered query interpretation using OpenAI."""
    
    def __init__(self):
        """Initialize OpenAI client."""
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def interpret_natural_language_query(
        self,
        query_text: str,
        columns_info: list,
        sample_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Interpret a natural language query and generate pandas code.
        
        Args:
            query_text: User's natural language query
            columns_info: List of column information from the data source
            sample_data: Optional sample data for context
            
        Returns:
            Dictionary with pandas code and explanation
        """
        
        # Prepare column information for the prompt
        columns_desc = "\n".join([
            f"- {col['name']} ({col['type']})" 
            for col in columns_info
        ])
        
        # Create the prompt for GPT-4
        prompt = f"""You are a data analysis expert. Given a dataset with the following columns:

{columns_desc}

User Query: "{query_text}"

Generate Python pandas code to answer this query. Follow these rules:
1. The DataFrame is already loaded as 'df'
2. Only use pandas operations (no other libraries)
3. Return the final result in a variable called 'result'
4. Keep code concise and efficient
5. Handle potential errors gracefully
6. If the query asks for aggregation (sum, average, count), return a single value or small summary
7. If the query asks for filtering or listing, return a DataFrame
8. Always ensure the result is JSON-serializable

Respond with ONLY valid Python code, no explanations or markdown.

Example format:
# Filter and calculate
filtered_df = df[df['column'] > value]
result = filtered_df['column'].sum()

Your code:"""

        try:
            # Call OpenAI API with new syntax
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Python pandas expert. Generate only executable pandas code without any explanations, markdown formatting, or additional text."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS
            )
            
            # Extract the generated code (new syntax)
            generated_code = response.choices[0].message.content.strip()
            
            # Clean up the code (remove markdown formatting if present)
            if "```python" in generated_code:
                generated_code = generated_code.split("```python")[1].split("```")[0].strip()
            elif "```" in generated_code:
                generated_code = generated_code.split("```")[1].split("```")[0].strip()
            
            return {
                "pandas_code": generated_code,
                "model_used": settings.OPENAI_MODEL,
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            raise Exception(f"Error calling OpenAI API: {str(e)}")
    
    def suggest_visualization(self, result_data: Any, query_text: str) -> Dict[str, Any]:
        """
        Suggest appropriate visualization based on query results.
        
        Args:
            result_data: The query result data
            query_text: Original query text
            
        Returns:
            Visualization configuration
        """
        import pandas as pd
        
        # Default visualization
        viz_config = {
            "type": "table",
            "config": {}
        }
        
        # If result is a DataFrame
        if isinstance(result_data, pd.DataFrame):
            rows, cols = result_data.shape
            
            # Single column numeric data -> bar chart
            if cols == 1 and pd.api.types.is_numeric_dtype(result_data.iloc[:, 0]):
                viz_config = {
                    "type": "bar",
                    "config": {
                        "x": result_data.index.tolist(),
                        "y": result_data.iloc[:, 0].tolist(),
                        "x_label": "Index",
                        "y_label": result_data.columns[0]
                    }
                }
            
            # Two columns (one categorical, one numeric) -> bar chart
            elif cols == 2:
                col_types = [pd.api.types.is_numeric_dtype(result_data[col]) for col in result_data.columns]
                if sum(col_types) == 1:  # One numeric column
                    cat_col = result_data.columns[col_types.index(False)]
                    num_col = result_data.columns[col_types.index(True)]
                    
                    viz_config = {
                        "type": "bar",
                        "config": {
                            "x": result_data[cat_col].tolist(),
                            "y": result_data[num_col].tolist(),
                            "x_label": cat_col,
                            "y_label": num_col
                        }
                    }
            
            # Time series detection (date column + numeric)
            date_cols = [col for col in result_data.columns if pd.api.types.is_datetime64_any_dtype(result_data[col])]
            if date_cols:
                date_col = date_cols[0]
                numeric_cols = [col for col in result_data.columns if pd.api.types.is_numeric_dtype(result_data[col])]
                if numeric_cols:
                    viz_config = {
                        "type": "line",
                        "config": {
                            "x": result_data[date_col].astype(str).tolist(),
                            "y": result_data[numeric_cols[0]].tolist(),
                            "x_label": date_col,
                            "y_label": numeric_cols[0]
                        }
                    }
            
        # Single numeric value -> KPI card
        elif isinstance(result_data, (int, float)):
            viz_config = {
                "type": "kpi",
                "config": {
                    "value": result_data,
                    "label": query_text[:50]  # Use query as label
                }
            }
        
        return viz_config