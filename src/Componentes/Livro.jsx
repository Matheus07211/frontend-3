import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CadastroLivro.css';
import '@fortawesome/fontawesome-free/css/all.css'; // Importa FontAwesome

const CadastroLivro = () => {
  const [livros, setLivros] = useState([]);
  const [autores, setAutores] = useState([]);
  const [dados, setDados] = useState({
    descricao: '',
    preco: '',
    qtdEstoque: '',
    aut_codigo: ''
  });
  const [editando, setEditando] = useState(false);
  const [livroEditando, setLivroEditando] = useState(null);

  // Busca os autores do banco de dados
  useEffect(() => {
    axios.get('http://localhost:4000/autor')
      .then(response => {
        setAutores(response.data.listaAutores || []);  // Verificando se listaAutores existe
      })
      .catch(error => console.error('Erro ao buscar autores:', error));
  }, []);

  // Busca os livros cadastrados
  useEffect(() => {
    axios.get('http://localhost:4000/livro')
      .then(response => {
        setLivros(response.data.listaLivros || []);  // Verificando se listaLivros existe
      })
      .catch(error => console.error('Erro ao buscar livros:', error));
  }, []);

  // Função para lidar com mudanças nos inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados({ ...dados, [name]: value });
  };

  // Função para salvar livro (cadastrar ou atualizar)
  const salvarLivro = () => {
    const dadosParaEnvio = {
      descricao: dados.descricao,
      preco: dados.preco,
      qtdEstoque: dados.qtdEstoque,
      autor: {
        codigo: dados.aut_codigo // Enviando o código do autor como o backend espera
      }
    };
  
    if (editando) {
      // Atualiza livro existente
      axios.put(`http://localhost:4000/livro/${livroEditando.codigo}`, dadosParaEnvio)
        .then(response => {
          if (response.status === 200) {
            setLivros(livros.map(livro => livro.codigo === livroEditando.codigo ? response.data : livro));
            alert('Alterações salvas com sucesso');
            limparFormulario();
            window.location.reload(); // Recarrega a página após atualizar
          }
        })
        .catch(error => console.error('Erro ao atualizar livro:', error));
    } else {
      // Cadastra novo livro
      axios.post('http://localhost:4000/livro', dadosParaEnvio)
        .then(response => {
          if (response.status === 200) {
            setLivros([...livros, response.data]);  // Atualiza a lista de livros com o novo livro cadastrado
            alert('Cadastrado com sucesso');
            limparFormulario();
            window.location.reload(); // Recarrega a página após cadastrar
          }
        })
        .catch(error => console.error('Erro ao cadastrar livro:', error));
    }
  };
  

  // Função para excluir um livro
  const excluirLivro = (codigo) => {
    axios.delete(`http://localhost:4000/livro/${codigo}`)
      .then(() => {
        alert('Livro excluído com sucesso');
        window.location.reload(); // Recarrega a página após excluir
      })
      .catch(error => {
        console.error('Erro ao excluir livro:', error.response ? error.response.data : error.message);
        alert('Erro ao excluir livro');
      });
  };
  
  
  // Função para iniciar a edição
  const editarLivro = (livro) => {
    setDados({
      descricao: livro.descricao,
      preco: livro.preco,
      qtdEstoque: livro.qtdEstoque,
      aut_codigo: livro.autores.length > 0 ? livro.autores[0].codigo : ''
    });
    setLivroEditando(livro);
    setEditando(true);
  };

  // Função para limpar o formulário
  const limparFormulario = () => {
    setDados({
      descricao: '',
      preco: '',
      qtdEstoque: '',
      aut_codigo: ''
    });
    setEditando(false);
    setLivroEditando(null);
  };

  return (
    <div>
      <h2>{editando ? 'Editar Livro' : 'Cadastro de Livro'}</h2>
      <form>
        <div>
          <label>Descrição</label>
          <input 
            type="text" 
            name="descricao" 
            value={dados.descricao} 
            onChange={handleChange} 
          />
        </div>
        <div>
          <label>Preço</label>
          <input 
            type="number" 
            name="preco" 
            value={dados.preco} 
            onChange={handleChange} 
          />
        </div>
        <div>
          <label>Quantidade em Estoque</label>
          <input 
            type="number" 
            name="qtdEstoque" 
            value={dados.qtdEstoque} 
            onChange={handleChange} 
          />
        </div>
        <div>
          <label>Autor</label>
          <select 
            name="aut_codigo" 
            value={dados.aut_codigo} 
            onChange={handleChange}
          >
            <option value="">Selecione um autor</option>
            {autores.map((autor) => (
              <option key={autor.codigo} value={autor.codigo}>
                {autor.nome}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={salvarLivro}>
          {editando ? 'Salvar Alterações' : 'Cadastrar Livro'}
        </button>
      </form>

      <h3>Livros Cadastrados</h3>
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Preço</th>
            <th>Quantidade</th>
            <th>Autor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {livros.map((livro) => (
            <tr key={livro.codigo}>
              <td>{livro.descricao}</td>
              <td>{livro.preco}</td>
              <td>{livro.qtdEstoque}</td>
              <td>
                {livro.autores && livro.autores.length > 0 ? livro.autores.map(autor => autor.nome).join(', ') : 'Nenhum autor'}
              </td>
              <td>
              <button 
                  onClick={() => editarLivro(livro)} 
                  className="editar"
                >
                  <i className="fas fa-pencil-alt"></i>
                </button>
                <button 
                  onClick={() => excluirLivro(livro.codigo)} 
                  className="excluir"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CadastroLivro;
