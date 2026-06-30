using System.Collections.Generic;
using System.Threading.Tasks;
using VisareBR.Core.Entities;

namespace VisareBR.Core.Events;

public record ArticlePublishedOrUpdatedEvent(Article Article, bool IsNew);

public interface IArticleEventDispatcher
{
    Task DispatchAsync(ArticlePublishedOrUpdatedEvent @event);
}

public interface IArticleEventListener
{
    Task HandleAsync(ArticlePublishedOrUpdatedEvent @event);
}

public class ArticleEventDispatcher : IArticleEventDispatcher
{
    private readonly IEnumerable<IArticleEventListener> _listeners;

    public ArticleEventDispatcher(IEnumerable<IArticleEventListener> listeners)
    {
        _listeners = listeners;
    }

    public async Task DispatchAsync(ArticlePublishedOrUpdatedEvent @event)
    {
        foreach (var listener in _listeners)
        {
            await listener.HandleAsync(@event);
        }
    }
}
