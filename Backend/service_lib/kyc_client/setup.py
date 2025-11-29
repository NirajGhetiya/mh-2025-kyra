from setuptools import setup, find_packages

setup(
    name='kyc_client',
    version='1.0',
    description='KYC Client with LangChain and OpenAI integration',
    packages=find_packages(),
    install_requires=[
        'langchain>=0.1.0',
        'langchain-openai>=0.1.0',
        'openai>=1.0.0',
        'pydantic>=2.0.0',
        'python-dotenv>=1.0.0',
        'requests>=2.25.0'
    ]
)